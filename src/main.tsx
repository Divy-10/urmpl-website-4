import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/unbounded';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import { Layout } from '@/components/layout';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Motion-only initial states (hidden-before-reveal) apply only once JS is running.
document.documentElement.classList.add('js-motion');

// Route-level code splitting; the shell, home and 404 stay in the main bundle.
const About = lazy(() => import('@/pages/About'));
const ProductsIndex = lazy(() => import('@/pages/Products').then((m) => ({ default: m.ProductsIndex })));
const ProductCategory = lazy(() => import('@/pages/Products').then((m) => ({ default: m.ProductCategory })));
const ProductDetail = lazy(() => import('@/pages/Products').then((m) => ({ default: m.ProductDetail })));
const IndustriesIndex = lazy(() => import('@/pages/Network').then((m) => ({ default: m.IndustriesIndex })));
const IndustryDetail = lazy(() => import('@/pages/Network').then((m) => ({ default: m.IndustryDetail })));
const GlobalNetwork = lazy(() => import('@/pages/Network').then((m) => ({ default: m.GlobalNetwork })));
const HowWeWork = lazy(() => import('@/pages/Network').then((m) => ({ default: m.HowWeWork })));
const Insights = lazy(() => import('@/pages/Company').then((m) => ({ default: m.Insights })));
const Careers = lazy(() => import('@/pages/Company').then((m) => ({ default: m.Careers })));
const Contact = lazy(() => import('@/pages/Company').then((m) => ({ default: m.Contact })));
const RequestQuote = lazy(() => import('@/pages/Company').then((m) => ({ default: m.RequestQuote })));
const Legal = lazy(() => import('@/pages/Company').then((m) => ({ default: m.Legal })));

const S = ({ children }: { children: React.ReactNode }) => <Suspense fallback={<div className="route-loading" aria-busy="true" />}>{children}</Suspense>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<S><About /></S>} />
          <Route path="products" element={<S><ProductsIndex /></S>} />
          <Route path="products/:category" element={<S><ProductCategory /></S>} />
          <Route path="products/:category/:slug" element={<S><ProductDetail /></S>} />
          <Route path="industries" element={<S><IndustriesIndex /></S>} />
          <Route path="industries/:slug" element={<S><IndustryDetail /></S>} />
          <Route path="global-network" element={<S><GlobalNetwork /></S>} />
          <Route path="how-we-work" element={<S><HowWeWork /></S>} />
          <Route path="insights" element={<S><Insights /></S>} />
          <Route path="careers" element={<S><Careers /></S>} />
          <Route path="contact" element={<S><Contact /></S>} />
          <Route path="request-quote" element={<S><RequestQuote /></S>} />
          <Route path="privacy" element={<S><Legal title="Privacy Policy" /></S>} />
          <Route path="terms" element={<S><Legal title="Terms of Use" /></S>} />
          <Route path="cookies" element={<S><Legal title="Cookie Policy" /></S>} />
          {/* Article and role templates only resolve published rows; none exist yet, so they 404. */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
