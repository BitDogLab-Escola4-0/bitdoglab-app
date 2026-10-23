/**
 * Interface base para provedores de comunicação
 * Define o contrato que todos os provedores devem seguir
 */
export interface IConnectionProvider {
  /**
   * Conecta ao dispositivo
   */
  connect(): Promise<void>;

  /**
   * Desconecta do dispositivo
   */
  disconnect(): Promise<void>;

  /**
   * Envia um comando para o dispositivo
   * @param command Comando a ser enviado
   */
  sendCommand(command: string): Promise<void>;

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean;

  /**
   * Obtém o tipo de conexão
   */
  getConnectionType(): string;

  /**
   * Listener para receber dados
   */
  onData(callback: (data: string) => void): void;

  /**
   * Listener para erros
   */
  onError(callback: (error: Error) => void): void;
}
