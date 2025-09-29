export default {
  beforeMount(el, binding) {
    let ignoreUntil = Date.now() + 200;
    el.clickOutsideEvent = function(event) {
      if (Date.now() < ignoreUntil) return;
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('mousedown', el.clickOutsideEvent);
    document.addEventListener('touchstart', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('mousedown', el.clickOutsideEvent);
    document.removeEventListener('touchstart', el.clickOutsideEvent);
  }
};
