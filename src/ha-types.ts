export interface HomeAssistant {
  connection: {
    sendMessagePromise<T>(msg: Record<string, unknown>): Promise<T>;
  };
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ): Promise<void>;
  states: Record<string, { state: string; attributes: Record<string, unknown> }>;
  language: string;
  themes?: { darkMode?: boolean };
}
