import { reactive, watch } from "vue";

const bus = reactive({});

export function useEventBus() {
  function emit(event, data = null) {
    bus[event] = data;
  }

  function on(event, callback) {
    watch(
      () => bus[event],
      () => callback(bus[event])
    );
  }

  return { emit, on };
}
