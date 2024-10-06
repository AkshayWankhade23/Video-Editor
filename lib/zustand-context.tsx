import React from "react";
import { StoreApi } from "zustand";

export const createZustandContext = <TInitial, TStore extends StoreApi<unknown>>(
    getStore: (initial: TInitial) => TStore
) => {
    const Context = React.createContext<TStore | null>(null);

    const Provider: React.FC<{ children: React.ReactNode; initialValue: TInitial }> = ({ children, initialValue }) => {
        const [store] = React.useState(() => getStore(initialValue));

        return <Context.Provider value={store}>{children}</Context.Provider>;
    };

    return {
        useContext: () => {
            const context = React.useContext(Context);
            if (!context) {
                throw new Error("Missing provider");
            }
            return context;
        },
        Context,
        Provider,
    };
};
