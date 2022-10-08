import {HubConnection, IStreamResult} from '@microsoft/signalr';
import {ComponentType, ReactNode} from "react";

export type StreamCreator<T> = (conn: HubConnection) => IStreamResult<T>;

export interface IConnectionStatus {
  connection: HubConnection | null;
  error: Error | null;
}

export interface IAutoProviderProps {
  children?: ReactNode;
}

export interface IConnectionContext {
  Provider: ComponentType<IAutoProviderProps>;
  useConnection(): IConnectionStatus;
  useStream<T>(streamCreator: StreamCreator<T>, inputs: any[]): IStreamState<T>;
}

export interface IStreamState<T> {
  error: Error | null;
  done: boolean;
  value: T | null;
}
