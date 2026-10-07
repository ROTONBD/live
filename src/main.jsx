import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Layout from './components/Layout.jsx'
import ChannelGrid from './components/ChannelGrid.jsx'
import Section from './components/Section.jsx'

function AllChannels() {
  const { channels } = useApp()
  return (
    <Section eyebrow="Live now" title="All channels">
      <ChannelGrid channels={channels} />
    </Section>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<AllChannels />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>,
)
