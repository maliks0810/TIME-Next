import { ViewerTab } from "../types/report.types";
import { useEffect, useState } from "react";


const TABS_KEY = "tabs";
const ACTIVE_TAB_KEY = "activeTabId";

export function usePersistedTabs() {
    // ✅ READ localStorage BEFORE FIRST RENDER
    const [tabs, setTabs] = useState<ViewerTab[]>(() => {
        try {
            const saved = localStorage.getItem(TABS_KEY);
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [activeTabId, setActiveTabId] = useState<string | null>(() => {
        try {
            return localStorage.getItem(ACTIVE_TAB_KEY);
        } catch {
            return null;
        }
    });

    // ✅ PERSIST on change (simple & reliable)
    useEffect(() => {
        try {
            localStorage.setItem(TABS_KEY, JSON.stringify(tabs));

            if (activeTabId) {
                localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
            } else {
                localStorage.removeItem(ACTIVE_TAB_KEY);
            }
        } catch (e) {
            console.error("Persist tabs failed:", e);
        }
    }, [tabs, activeTabId]);

    return {
        tabs,
        setTabs,
        activeTabId,
        setActiveTabId
    };
}