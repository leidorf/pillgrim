type Listener = (msg: string | null) => void;
let _listener: Listener | null = null;

export const toast = {
  show(msg: string) {
    _listener?.(msg);
  },
  hide() {
    _listener?.(null);
  },
  onShow(fn: Listener) {
    _listener = fn;
  },
};
