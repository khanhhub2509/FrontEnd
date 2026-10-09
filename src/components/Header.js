import { Badge, Button, Container, Nav, Navbar } from 'react-bootstrap';

const navItems = [
  { href: '#categories', label: 'Danh mục', page: 'home' },
  { href: '#featured', label: 'Sách nổi bật', page: 'home' },
  { href: '#support', label: 'Tư vấn', page: 'home' },
];

function Header({ cartCount, currentPage, onNavigate }) {
  const handleNavClick = (event, item) => {
    if (currentPage !== 'home') {
      event.preventDefault();
      onNavigate(item.page);
    }
  };

  return (
    <Navbar expand="lg" className="site-header" sticky="top">
      <Container fluid className="px-0">
        <Navbar.Brand
          href="#home"
          className="brand"
          onClick={(event) => {
            event.preventDefault();
            onNavigate('home');
          }}
        >
          <span className="brand-mark">B</span>
          <span>
            <strong>BookNest</strong>
            <span>Chuyên trang sách trực tuyến</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="bookstore-navigation" />

        <Navbar.Collapse id="bookstore-navigation">
          <Nav className="main-nav mx-auto">
            {navItems.map((item) => (
              <Nav.Link
                href={item.href}
                key={item.href}
                onClick={(event) => handleNavClick(event, item)}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <Button
            className="admin-button"
            type="button"
            onClick={() => onNavigate('admin')}
          >
            Quản lý Admin
          </Button>

          <Button
            className="cart-button"
            type="button"
            onClick={() => onNavigate('cart')}
          >
            Giỏ hàng <Badge bg="light">{cartCount}</Badge>
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
