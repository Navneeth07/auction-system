import axios, { AxiosError } from "axios"

type ApiErrorResponse = {
  message?: string
}

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>

    return (
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Server Error"
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong"
}
