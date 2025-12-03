import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'
// Contexts
import { GlobalContextProvider } from './contexts/GlobalContext.jsx'
import { UserContextProvider } from './contexts/UserContext.jsx'
import { MainPageContextProvider } from './contexts/MainPageContext.jsx'
import { MessageDialogProvider } from './components/others/MessageDialog.jsx'

createRoot(document.getElementById('root')).render(
    <GlobalContextProvider>
        <UserContextProvider> 
            <MainPageContextProvider>
                <StrictMode>
                    <MessageDialogProvider>
                        <App />
                    </MessageDialogProvider>
                </StrictMode>
            </MainPageContextProvider>
        </UserContextProvider>
    </GlobalContextProvider>
)