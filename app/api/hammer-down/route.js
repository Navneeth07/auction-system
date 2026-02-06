export async function POST(req) {
  const session = await mongoose.startSession();

  try {
    await connectDB();
    session.startTransaction();

    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    const { tournamentPlayerId } = await req.json();

    const player = await TournamentPlayer.findOne({
      _id: tournamentPlayerId,
      createdBy: userId,
    }).session(session);

    if (!player) {
      throw new Error("Player not found");
    }

    if (player.status === "sold") {
      throw new Error("Player already finalized as sold");
    }

    // Get last bid history (to know who won)
    const lastBid = await BidHistory.findOne({
      tournamentPlayerId,
      createdBy: userId,
    })
      .sort({ createdAt: -1 })
      .session(session);

    // CASE 1: No bids → mark as UNSOLD
    if (!lastBid) {
      player.status = "unsold";

      await player.save({ session });

      await session.commitTransaction();

      return NextResponse.json({
        message: "Player marked as UNSOLD",
        data: {
          tournamentPlayerId,
          status: "unsold",
        },
      });
    }

    // CASE 2: Player SOLD

    player.status = "sold";
    player.soldTo = lastBid.teamId;

    // 🔥 FINAL PRICE COMES FROM CURRENT basePrice
    player.soldAmount = player.basePrice;

    await player.save({ session });

    await session.commitTransaction();

    return NextResponse.json({
      message: "Player sold successfully",
      data: {
        tournamentPlayerId,
        soldTo: lastBid.teamId,
        soldAmount: player.basePrice,
        status: "sold",
      },
    });

  } catch (error) {
    await session.abortTransaction();

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );

  } finally {
    session.endSession();
  }
}
