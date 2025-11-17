import { createContext, Dispatch, ReactNode, useContext, useState } from 'react';

const EntryBusyContext = createContext<boolean>(false);
const SetEntryBusyContext = createContext<Dispatch<boolean>>(null!);
const EntryEditingContext = createContext<boolean>(false);
const SetEntryEditingContext = createContext<Dispatch<boolean>>(null!);

export const useEntryBusyContext = () => useContext(EntryBusyContext);
export const useSetEntryBusyContext = () => useContext(SetEntryBusyContext);
export const useEntryEditingContext = () => useContext(EntryEditingContext);
export const useSetEntryEditingContext = () => useContext(SetEntryEditingContext);

export const ModelCatalogEntryProvider = (props: { children: ReactNode }) => {
    const { children } = props;
    // const [entry, setEntry] = useState<ModelCatalogEntry | null>(null);
    const [busy, setBusy] = useState<boolean>(false);
    const [editing, setEditing] = useState<boolean>(false);

    return (
        <EntryBusyContext.Provider value={busy}>
            <SetEntryBusyContext.Provider value={setBusy}>
                <EntryEditingContext.Provider value={editing}>
                    <SetEntryEditingContext.Provider value={setEditing}>
                        {children}
                    </SetEntryEditingContext.Provider>
                </EntryEditingContext.Provider>
            </SetEntryBusyContext.Provider>
        </EntryBusyContext.Provider>
    );
};
