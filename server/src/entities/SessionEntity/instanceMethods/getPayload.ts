import type SessionEntity from "../SessionEntity";

export default function getPayload(this: SessionEntity) {
  return this.payload;
}
