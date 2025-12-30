import { render, screen } from '@testing-library/react';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import type { Vehicle } from '@/types';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt} src={props.src} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockVehicle: Vehicle = {
  id: 'test-vehicle-1',
  name: '테스트 차량',
  brandId: 'brand-hyundai',
  category: 'SUV',
  fuelTypes: ['GASOLINE', 'HYBRID'],
  driveTypes: ['AWD'],
  seatingCapacityMin: 5,
  seatingCapacityMax: 7,
  basePrice: 50000000,
  rentPrice60_0: 500000,
  rentPrice48_0: 550000,
  rentPrice36_0: 600000,
  rentPrice24_0: 700000,
  rentPrice60_25: 450000,
  rentPrice48_25: 500000,
  rentPrice36_25: 550000,
  rentPrice24_25: 650000,
  rentPrice60_50: 400000,
  rentPrice48_50: 450000,
  rentPrice36_50: 500000,
  rentPrice24_50: 600000,
  thumbnail: '/images/test-car.jpg',
  images: ['/images/test-car-1.jpg', '/images/test-car-2.jpg'],
  imageSizePreset: 'vehicle',
  imagePadding: 0,
  baseModelName: '가솔린 1.6',
  hasOtherModels: true,
  isPopular: true,
  isNew: true,
  isActive: true,
  sortOrder: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('VehicleCard', () => {
  it('renders vehicle name', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText('테스트 차량')).toBeInTheDocument();
  });

  it('renders vehicle category label', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText('SUV')).toBeInTheDocument();
  });

  it('renders fuel type labels', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText('가솔린/하이브리드')).toBeInTheDocument();
  });

  it('renders drive type labels', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText('AWD')).toBeInTheDocument();
  });

  it('renders rent price', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText(/월 500,000원~/)).toBeInTheDocument();
  });

  it('renders new badge when isNew is true', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText('신차')).toBeInTheDocument();
  });

  it('renders popular badge when isPopular is true', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText('인기')).toBeInTheDocument();
  });

  it('does not render badges when isNew and isPopular are false', () => {
    const vehicleWithoutBadges = { ...mockVehicle, isNew: false, isPopular: false };
    render(<VehicleCard vehicle={vehicleWithoutBadges} />);
    expect(screen.queryByText('신차')).not.toBeInTheDocument();
    expect(screen.queryByText('인기')).not.toBeInTheDocument();
  });

  it('renders detail button with correct link', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    const detailButton = screen.getByRole('link', { name: '상세보기' });
    expect(detailButton).toHaveAttribute('href', '/vehicle/test-vehicle-1');
  });

  it('renders thumbnail image', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    const image = screen.getByAltText('테스트 차량');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/test-car.jpg');
  });

  it('renders placeholder when no thumbnail', () => {
    const vehicleWithoutThumbnail = { ...mockVehicle, thumbnail: null };
    render(<VehicleCard vehicle={vehicleWithoutThumbnail} />);
    // Should show vehicle name as placeholder text
    const placeholders = screen.getAllByText('테스트 차량');
    expect(placeholders.length).toBeGreaterThan(1);
  });
});
