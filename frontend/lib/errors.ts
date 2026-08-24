import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "Algo deu errado.") {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const firstDetail = detail[0];
      if (typeof firstDetail === "string") {
        return firstDetail;
      }
      if (firstDetail && typeof firstDetail === "object" && "msg" in firstDetail) {
        const message = firstDetail.msg;
        if (typeof message === "string") {
          return message;
        }
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
