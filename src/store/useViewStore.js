import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Per-tab view state (sessionStorage) so multiple tabs can act as independent "terminals".
const useViewStore = create(
  persist(
    (set) => ({
      selectedVariety: { categoryId: 'steel', typeId: 'rebar' },
      setSelectedVariety: (variety) => set({ selectedVariety: variety }),
    }),
    {
      name: 'hni-view-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useViewStore;

