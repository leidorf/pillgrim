import { useCallback, useRef, useState } from "react";
import type PagerView from "react-native-pager-view";

type Params = {
  totalPages: number;
  onComplete: () => void;
};

export const useOnboardingPager = ({ totalPages, onComplete }: Params) => {
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);

  const isLast = page === totalPages - 1;
  const isFirst = page === 0;

  const goToPage = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete();
      return;
    }
    pagerRef.current?.setPage(page + 1);
  }, [isLast, onComplete, page]);

  const goPrevious = useCallback(() => {
    if (isFirst) return;
    pagerRef.current?.setPage(page - 1);
  }, [isFirst, page]);

  const handlePageSelected = useCallback((index: number) => {
    setPage(index);
  }, []);

  return {
    pagerRef,
    page,
    isFirst,
    isLast,
    goNext,
    goPrevious,
    goToPage,
    handlePageSelected,
  };
};
