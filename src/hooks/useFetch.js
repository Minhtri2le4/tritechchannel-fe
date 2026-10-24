import { useCallback, useEffect, useState } from 'react';

// Gọi API khi component mount hoặc khi deps đổi.
// fetcher: () => Promise<{ data, meta }>. Trả về { data, meta, loading, error, reload }.
// Dữ liệu cũ được giữ lại trong lúc tải dữ liệu mới (tránh nhấp nháy).
export default function useFetch(fetcher, deps = []) {
  const [version, setVersion] = useState(0);
  const key = JSON.stringify([...deps, version]);
  // key: kết quả này thuộc về lần gọi nào -> so với key hiện tại để biết đang loading hay không
  const [state, setState] = useState({ key: null, data: null, meta: null, error: null });

  useEffect(() => {
    let cancelled = false; // bỏ qua kết quả cũ nếu deps đã đổi trong lúc chờ
    fetcher()
      .then(({ data, meta }) => !cancelled && setState({ key, data, meta, error: null }))
      .catch((error) => !cancelled && setState((s) => ({ ...s, key, error })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const loading = state.key !== key;
  return { data: state.data, meta: state.meta, error: loading ? null : state.error, loading, reload };
}
