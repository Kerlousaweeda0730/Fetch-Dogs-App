import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SearchPage from './SearchPage';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('SearchPage', () => {
  test('renders SearchPage component', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));
    render(<SearchPage />);
    expect(screen.getByText('Dog Search')).toBeInTheDocument();
  });

  test('fetches dogs on component mount', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ resultIds: [], total: 0 }));
    render(<SearchPage />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  test('applies breed filter and fetches dogs', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ resultIds: [], total: 0 }));

    render(<SearchPage />);
    
    // Simulate user interaction with breed dropdown
    await waitFor(() => fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Labrador' },
    }));

    // Click on 'Apply Filter' button
    fireEvent.click(screen.getByText(/apply filter/i));
    
    // Assert the correct fetch call was made
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.any(Object)));
  });

  test('displays list of dogs', async () => {
    const dogs = [
      { id: '1', img: 'dog1.jpg', name: 'Buddy', breed: 'Labrador', age: 3, zip_code: '12345' },
      { id: '2', img: 'dog2.jpg', name: 'Max', breed: 'Poodle', age: 5, zip_code: '67890' }
    ];
    
    fetchMock.mockResponseOnce(JSON.stringify({ resultIds: dogs.map(dog => dog.id), total: dogs.length }));
    
    render(<SearchPage />);
    
    // Wait for dogs to be fetched and displayed
    await waitFor(() => {
      dogs.forEach(dog => {
        expect(screen.getByText(dog.name)).toBeInTheDocument();
      });
    });
  });


  describe('Match Modal', () => {
    test('displays a match in a modal', async () => {
      const dogs = [
        { id: '1', img: 'dog1.jpg', name: 'Buddy', breed: 'Labrador', age: 3, zip_code: '12345' }
        // Include other dog objects as needed
      ];
      fetchMock.mockResponses(
        [JSON.stringify({ resultIds: dogs.map(dog => dog.id), total: dogs.length }), { status: 200 }],
        [JSON.stringify({ match: '1' }), { status: 200 }]
      );

      render(<SearchPage />);

      // Wait for dogs to be fetched and displayed
      await waitFor(() => {
        fireEvent.click(screen.getByLabelText(/favorite/i));
      });

      // Click on 'Find a Match' button
      fireEvent.click(screen.getByText(/find a match/i));

      // Assert that the modal is displayed with the correct content
      await waitFor(() => {
        expect(screen.getByText('Meet Your Match!')).toBeInTheDocument();
        expect(screen.getByText(dogs[0].name)).toBeInTheDocument();
      });
    });
    
    test('closes the modal when close button is clicked', async () => {
      const dogs = [
        { id: '1', img: 'dog1.jpg', name: 'Buddy', breed: 'Labrador', age: 3, zip_code: '12345' }
        // Include other dog objects as needed
      ];
      fetchMock.mockResponses(
        [JSON.stringify({ resultIds: dogs.map(dog => dog.id), total: dogs.length }), { status: 200 }],
        [JSON.stringify({ match: '1' }), { status: 200 }]
      );

      render(<SearchPage />);

      // Wait for dogs to be fetched and displayed
      await waitFor(() => {
        fireEvent.click(screen.getByLabelText(/favorite/i));
      });

      // Click on 'Find a Match' button
      fireEvent.click(screen.getByText(/find a match/i));

      // Wait for the modal to be displayed
      await waitFor(() => {
        expect(screen.getByText('Meet Your Match!')).toBeInTheDocument();
      });

      // Click on the 'Close' button in the modal
      fireEvent.click(screen.getByText('Close'));

      // Assert that the modal is no longer displayed
      expect(screen.queryByText('Meet Your Match!')).not.toBeInTheDocument();
    });
  });
});