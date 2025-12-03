import { createContext, useState, useContext } from "react";


export const THEMES_OPTIONS = [
    'darkly', 'superhero', 'cyborg', 'journal', 'lumen', 'cerulean'
];

export const GlobalContext = createContext(null);

export const GlobalContextProvider = ({ children }) => {

    const [themeName, setThemeName] = useState('lumen');
    const themeOptions = ['darkly', 'superhero', 'cyborg', 'journal', 'lumen', 'cerulean']

    return (
        <GlobalContext.Provider
            value={{
                themeName, themeOptions, setThemeName
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => useContext(GlobalContext);