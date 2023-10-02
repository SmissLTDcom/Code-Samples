import { useEffect } from 'react';

export const useOutClick = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  cb: (e: MouseEvent) => void,
): void => {
  useEffect(() => {
    const handleOutClick = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as T)) {
        cb(e);
      }
    };

    window.addEventListener('click', handleOutClick);
    return (): void => {
      window.removeEventListener('click', handleOutClick);
    };
  }, [ref, cb]);
};
