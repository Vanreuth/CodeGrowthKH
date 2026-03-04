export interface CodeSnippetDto {
  id: number;
  title: string;
  code: string;
  language: string;
  explanation: string | null;
  orderIndex: number;
  createdAt: string;
  lessonId: number;
}

export interface CreateSnippetRequest {
  title: string;
  code: string;
  language: string;
  explanation?: string;
  orderIndex: number;
  lessonId: number;
}

export interface UpdateSnippetRequest extends Partial<CreateSnippetRequest> {}