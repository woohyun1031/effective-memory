'use client';

import useSearchForm from '#hooks/useScrollForm';
import dayjs from 'dayjs';
import React from 'react';

const mock1 = {
  imageId1: 'https://toss.tech/wp-content/uploads/2023/03/00017-3291509353.png',
  content:
    'REST Docs 를 최소한의 코드로 작성하면서 변화에도 더 유연하게 대처할 수 있는 tosspayments-restdocs 라이브러리와, 라이브러리에 녹인 기술들을 소개합니다.',
};

const mock2 = {
  iamgeId2: 'https://toss.tech/wp-content/uploads/2023/03/declarative.png',
  content: '선언적인 코드, 토스 프론트엔드 챕터는 어떻게 생각을 하고 있을까요?',
};

export default function Form({ data }: { data: any }) {
  console.log(data.results);
  const { onSubmit } = useSearchForm();
  const hasNextPage = data?.has_more ?? false;

  const observer = React.useRef<IntersectionObserver>();
  const lastBookElementRef = React.useCallback(
    (node: any) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          onSubmit({
            page: (data.results.length += 10),
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasNextPage],
  );

  return (
    <>
      <div className="flex w-full justify-center">
        <div className="min-h-screen w-full max-w-container px-8">
          <div className="mt-14 mb-8">
            <span className="font-sansM text-3xl text-gray-900">블로그</span>
          </div>
          {data?.results?.map((item: any, index: number) => (
            <a
              className="group mt-14 flex w-full cursor-pointer flex-col align-middle lg:flex-row"
              key={item.id}
              href={item.url}
              target="_blank"
              {...(index + 1 === data?.results?.length
                ? { ref: lastBookElementRef }
                : {})}
            >
              <img
                src={index % 2 === 0 ? mock1.imageId1 : mock2.iamgeId2}
                className="mr-12 h-56 w-full rounded-xl object-cover transition delay-75 duration-500 ease-in-out group-hover:z-0 group-hover:-translate-y-2 group-hover:shadow-lg lg:w-56"
              />
              <div className="flex flex-col justify-center">
                <span className="mt-4 mb-4 inline-block font-sansM text-3xl text-gray-800 transition delay-75 duration-500 ease-in-out group-hover:text-blue-600 lg:mt-0">
                  {item.properties.Name.title[0].text.content}
                </span>
                <span className="mb-4 inline-block font-sansM text-xl text-gray-700">
                  {index % 2 === 0 ? mock1.content : mock2.content}
                </span>
                <span className="mb-4 inline-block font-sansM text-base text-gray-600">
                  {dayjs(item.created_time).format('YYYY-MM-DD')}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}