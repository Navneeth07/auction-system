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

    if (!player) throw new Error("Player not found");

    if (player.status === "sold") {
      throw new Error("Player already finalized as sold");
    }

    // Get last bid
    const lastBid = await BidHistory.findOne({
      tournamentPlayerId,
      createdBy: userId,
    })
      .sort({ createdAt: -1 })
      .session(session);

    // CASE 1: No bids → UNSOLD
    if (!lastBid) {
      player.status = "unsold";
      await player.save({ session });

      await session.commitTransaction();

      return NextResponse.json({
        message: "Player marked as UNSOLD",
      });
    }

    // CASE 2: Player SOLD

    player.status = "sold";
    player.soldTo = lastBid.teamId;      // 🔥 STORE TEAM
    player.soldAmount = lastBid.bidAmount; // 🔥 STORE AMOUNT

    await player.save({ session });

    await session.commitTransaction();

    return NextResponse.json({
      message: "Player sold successfully",
      soldTo: lastBid.teamId,
      amount: lastBid.bidAmount,
    });

  } catch (error) {
    await session.abortTransaction();
    return NextResponse.json({ message: error.message }, { status: 500 });

  } finally {
    session.endSession();
  }
}
