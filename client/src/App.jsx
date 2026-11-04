import ProductList from './pages/ProductList'
import AdminPage from './pages/AdminPage'

function App() {
  if (window.location.pathname === '/admin') {
    return <AdminPage />
  }

  return <ProductList />
}

export default App
