export interface FileGenerator {
  readonly filepath: string;

  generate(): Promise<string>;
}
