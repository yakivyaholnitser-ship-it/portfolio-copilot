export type ServiceStatus = "ok";

export interface HealthResponse {
  readonly service: "portfolio-copilot";
  readonly status: ServiceStatus;
  readonly version: string;
  readonly timestamp: string;
}
