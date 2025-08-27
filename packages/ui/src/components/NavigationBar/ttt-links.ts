const env = "development";

export type TTTNames = "TRAP" | "TOD" | "TIP"

interface LinkDetails {
    title: TTTNames,
    url: string,
    disabled: boolean
}

export const TTTLinks: Record<TTTNames, LinkDetails>  = {
    "TRAP": {
        title: "TRAP",
        url: (env == 'development' ? 'https://trap-dev.np.tcw.com/' : env == 'qa' ? 'https://trap-qa.np.tcw.com/' : env == 'sandbox' ? 'https://trap-sandbox.np.tcw.com/' : env == 'prod' ? 'https://trap-parallel.pd.tcw.com/' : 'http://localhost:4000'),
        disabled: false
    },
    "TOD": {
        title: "TOD",
        url: (env == 'development' ? 'https://tod-dev.np.tcw.com/' : env == 'qa' ? 'https://tod-qa.np.tcw.com/' : env == 'sandbox' ? 'https://tod-sandbox.np.tcw.com/' : env == 'prod' ? 'https://tod.pd.tcw.com/' : 'http://localhost:4000'),
        disabled: false
    },
    "TIP": {
        title: "TIP",
        url: (env == 'development' ? 'https://tipuat.corp.tcw.com/' : env == 'qa' ? 'https://tipuat.corp.tcw.com/' : env == 'sandbox' ? 'https://tipuat.corp.tcw.com/' : env == 'prod' ? 'https://tip.corp.tcw.com/' : 'http://localhost:4000'),
        disabled: false
    },
}