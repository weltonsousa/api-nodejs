import { HttpRequest, HttpResponse } from "./http";

export interface Controller {
  handle(httpRequeset: HttpRequest): HttpResponse
}