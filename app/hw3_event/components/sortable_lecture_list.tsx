'use client';

import { useState, useRef } from "react";

interface Lecture {
  id: number;
  title: string;
  code: string;
}

const initialLectures: Lecture[] = [
  { id: 1, title: "운영체제 및 실험", code: "CS330" },
  { id: 2, title: "프로그래밍 언어", code: "CS320" },
  { id: 3, title: "알고리즘 개론", code: "CS300" },
  { id: 4, title: "프로그램 논증", code: "CS424" },
  { id: 5, title: "문제해결기법", code: "CS202" }
];

function SortableLectureList() {
  const [lectures, setLectures] = useState<Lecture[]>(initialLectures);
  const draggedLecture = useRef<number | null>(null);

  const finishSorting = () => {
    draggedLecture.current = null;
  };

  const moveLecture = (targetId: number) => {
    const sourceId = draggedLecture.current;
    if (sourceId === null) return;

    setLectures((currentLectures) => {
      const sourceIndex = currentLectures.findIndex((lecture) => lecture.id === sourceId);
      const targetIndex = currentLectures.findIndex((lecture) => lecture.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return currentLectures;

      const reorderedLectures = [...currentLectures];
      const [movingLecture] = reorderedLectures.splice(sourceIndex, 1);
      reorderedLectures.splice(targetIndex, 0, movingLecture);
      return reorderedLectures;
    });

    finishSorting();
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">내 수업 목록</h2>
      <p className="text-sm text-gray-600 mb-4">드래그하여 순서를 변경하세요</p>

      <ul className="space-y-2">
        {lectures.map((lecture) => (
          <li
            key={lecture.id}
            draggable
            onDragStart={(dragEvent) => {
              draggedLecture.current = lecture.id;
              dragEvent.dataTransfer.setData("text/plain", String(lecture.id));
            }}
            onDragOver={(dragEvent) => {
              dragEvent.preventDefault();
            }}
            onDrop={(dragEvent) => { // 놓으면 순서 변경
              dragEvent.preventDefault();
              moveLecture(lecture.id);
            }}
            onDragEnd={finishSorting}
            className="p-3 rounded-md border transition-all duration-200 border-gray-300 hover:border-gray-400 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{lecture.title}</h3>
                <p className="text-sm text-gray-500">{lecture.code}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SortableLectureList;
