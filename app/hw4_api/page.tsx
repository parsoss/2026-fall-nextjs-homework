"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import type { word as Word } from "./type/word";

const emptyFilters = { author: "", display_author: "", message: "", year: "" };
const searchFields = [
  { key: "author", label: "발언자" },
  { key: "display_author", label: "표시 이름" },
  { key: "message", label: "내용" },
  { key: "year", label: "연도" },
] as const;

const wordFields = [
  { key: "author", label: "발언자" },
  { key: "display_author", label: "표시 이름" },
  { key: "year", label: "연도" },
] as const;

async function requestJson<ResponseBody>(url: string, options?: RequestInit): Promise<ResponseBody> {
  const response = await fetch(url, options);
  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.error ?? "요청을 처리하지 못했습니다.");
  }

  return responseBody;
}

function WordForm({ currentWord, onSaved }: { currentWord?: Word; onSaved?: () => void }) {
  const queryClient = useQueryClient();
  const formId = currentWord ? `edit-word-${currentWord.id}` : "new-word";
  const [draft, setDraft] = useState({
    author: currentWord?.author ?? "",
    display_author: currentWord?.display_author ?? "",
    message: currentWord?.message ?? "",
    year: currentWord ? String(currentWord.year) : "",
    context: currentWord?.context ?? "",
  });

  const saveWord = useMutation({
    mutationFn: (payload: Omit<Word, "id">) => requestJson<{ id: number }>(
      currentWord ? `/api/word/${currentWord.id}` : "/api/word",
      {
        method: currentWord ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["words"] });
      if (currentWord) {
        onSaved?.();
      } else {
        setDraft({ author: "", display_author: "", message: "", year: "", context: "" });
      }
    },
  });

  const submitWord = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    saveWord.mutate({ ...draft, year: Number(draft.year) });
  };

  return (
    <form aria-label={currentWord ? "어록 수정" : "어록 등록"} onSubmit={submitWord}>
      <fieldset className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {wordFields.map(({ key, label }) => (
            <label key={key} className="block text-sm">
              {label}
              <input
                name={key}
                type={key === "year" ? "number" : "text"}
                step={key === "year" ? 1 : undefined}
                required
                value={draft[key]}
                onChange={(changeEvent) => setDraft({ ...draft, [key]: changeEvent.target.value })}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </label>
          ))}
        </div>
        <div>
          <label htmlFor={`${formId}-message`} className="block text-sm">내용</label>
          <textarea
            id={`${formId}-message`}
            name="message"
            required
            rows={3}
            value={draft.message}
            onChange={(changeEvent) => setDraft({ ...draft, message: changeEvent.target.value })}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-context`} className="block text-sm">맥락 (선택)</label>
          <textarea
            id={`${formId}-context`}
            name="context"
            rows={2}
            value={draft.context}
            onChange={(changeEvent) => setDraft({ ...draft, context: changeEvent.target.value })}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-white">
          {currentWord ? "수정 저장" : "등록"}
        </button>
      </fieldset>
      {saveWord.error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {saveWord.error.message}
        </p>
      )}
    </form>
  );
}

export default function Homework4Page() {
  const queryClient = useQueryClient();
  const [searchDraft, setSearchDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [editingId, setEditingId] = useState<number | null>(null);
  const searchParams = new URLSearchParams(
    Object.entries(filters).filter(([, filterValue]) => filterValue !== ""),
  );
  const listUrl = searchParams.size ? `/api/word/search?${searchParams}` : "/api/word";

  const wordsQuery = useQuery({
    queryKey: ["words", filters],
    queryFn: ({ signal }) => requestJson<Word[]>(listUrl, { signal }),
    retry: false,
  });

  const deleteWord = useMutation({
    mutationFn: (id: number) => requestJson<{ ok: boolean }>(`/api/word/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["words"] });
    },
  });

  const searchWords = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setFilters(searchDraft);
    setEditingId(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">SPARCS 어록</h1>
        <section className="rounded border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">어록 등록</h2>
          <WordForm />
        </section>
        <section className="rounded border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">어록 검색</h2>
          <form aria-label="어록 검색" onSubmit={searchWords} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {searchFields.map(({ key, label }) => (
                <label key={key} className="block text-sm">
                  {label}
                  <input
                    name={key}
                    type={key === "year" ? "number" : "text"}
                    step={key === "year" ? 1 : undefined}
                    value={searchDraft[key]}
                    onChange={(changeEvent) => setSearchDraft({ ...searchDraft, [key]: changeEvent.target.value })}
                    className="mt-1 w-full rounded border border-gray-300 p-2"
                  />
                </label>
              ))}
            </div>
            <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-white">검색</button>
          </form>
        </section>
        <section>
          <h2 className="mb-4 text-lg font-semibold">어록 목록</h2>
          {deleteWord.error && <p role="alert" className="mb-3 text-sm text-red-700">{deleteWord.error.message}</p>}
          {wordsQuery.isPending ? (
            <p role="status">불러오는 중...</p>
          ) : wordsQuery.isError ? (
            <p role="alert" className="text-red-700">{wordsQuery.error.message}</p>
          ) : wordsQuery.data.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {wordsQuery.data.map((entry) => (
                <li key={entry.id} className="rounded border border-gray-200 bg-white p-4">
                  {editingId === entry.id ? (
                    <WordForm currentWord={entry} onSaved={() => setEditingId(null)} />
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap break-words">{entry.message}</p>
                      <p className="mt-2 text-sm text-gray-600">{entry.display_author} · {entry.year}년</p>
                      <p className="text-sm text-gray-600">발언자: {entry.author}</p>
                      {entry.context && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">맥락: {entry.context}</p>}
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(entry.id)}
                          className="rounded border border-gray-300 px-3 py-1"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteWord.mutate(entry.id)}
                          className="rounded border border-red-200 px-3 py-1 text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
