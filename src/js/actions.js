export const WINDOW_RESIZE = 'windows_resize';
export const onWindowResize = (e) => {
  return {
    type: WINDOW_RESIZE,
    height: window.innerHeight,
  }
}

export default onWindowResize;