# import os
# import requests
# from bs4 import BeautifulSoup
# from urllib.parse import urljoin
# import pandas as pd
# from tqdm import tqdm
# from concurrent.futures import ThreadPoolExecutor, as_completed

# # Define the path to your CSV file
# filtered_hotel_details_path = './Filtered_Hotel_Details_Booking.csv'  # Adjust the path as needed

# # Load the hotel details from the CSV
# hotel_details_df = pd.read_csv(filtered_hotel_details_path)

# # Define a function to extract the first image URL from a hotel's webpage
# def extract_img_url(hotel_url):
#     try:
#         response = requests.get(hotel_url)
#         if response.status_code == 200:
#             soup = BeautifulSoup(response.text, 'html.parser')
#             anchor_tags = soup.find_all('a', {'href': '#'})
#             for anchor_tag in anchor_tags:
#                 img_tag = anchor_tag.find('img')
#                 if img_tag:
#                     return urljoin(hotel_url, img_tag['src'])  # Return the first found image URL
#     except Exception as e:
#         return None  # Return None if any error occurs
#     return None  # Return None if no image found

# # Set up ThreadPoolExecutor for concurrent requests
# def extract_urls_concurrently(urls):
#     image_urls = [None] * len(urls)  # Preallocate list to hold image URLs
#     with ThreadPoolExecutor(max_workers=100) as executor:  # Adjust max_workers as needed
#         future_to_index = {executor.submit(extract_img_url, url): i for i, url in enumerate(urls)}

#         # Progress bar setup
#         futures = tqdm(as_completed(future_to_index), total=len(urls), desc='Extracting image URLs')
#         for future in futures:
#             index = future_to_index[future]
#             image_urls[index] = future.result()  # Store result at corresponding index
#     return image_urls

# # Extract image URLs using multithreading
# hotel_details_df['image_url'] = extract_urls_concurrently(hotel_details_df['final_url'])

# # Save the updated DataFrame to a new CSV file
# updated_file_path = './Updated_Hotel_Details_Booking_with_Images.csv'  # Change this as needed
# hotel_details_df.to_csv(updated_file_path, index=False)

# print(f"Updated hotel details with image URLs have been saved to: {updated_file_path}")
import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pandas as pd
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed

# Define a function to extract the first image URL from a hotel's webpage
def extract_img_url(hotel_url):
    try:
        response = requests.get(hotel_url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            anchor_tags = soup.find_all('a', {'href': '#'})
            for anchor_tag in anchor_tags:
                img_tag = anchor_tag.find('img')
                if img_tag:
                    return urljoin(hotel_url, img_tag['src'])  # Return the first found image URL
    except Exception as e:
        return None  # Return None if any error occurs
    return None  # Return None if no image found

# Set up ThreadPoolExecutor for concurrent requests
def extract_urls_concurrently(urls):
    image_urls = [None] * len(urls)  # Preallocate list to hold image URLs
    with ThreadPoolExecutor(max_workers=100) as executor:  # Adjust max_workers as needed
        future_to_index = {executor.submit(extract_img_url, url): i for i, url in enumerate(urls)}

        # Progress bar setup
        futures = tqdm(as_completed(future_to_index), total=len(urls), desc='Extracting image URLs')
        for future in futures:
            index = future_to_index[future]
            image_urls[index] = future.result()  # Store result at corresponding index
    return image_urls

# Initialize an empty DataFrame to hold all the data
all_hotels_df = pd.DataFrame()

# Loop over each CSV file and process them
for i in tqdm(range(0, 101000, 10000), desc='Processing files'):
    file_path = f'./Filtered_Hotel_Details_Booking_from_{i}.csv'
    # Load the hotel details from the CSV
    hotel_details_df = pd.read_csv(file_path)

    # Extract image URLs using multithreading
    hotel_details_df['image_url'] = extract_urls_concurrently(hotel_details_df['final_url'])

    # Append the results to the main DataFrame
    all_hotels_df = all_hotels_df.append(hotel_details_df, ignore_index=True)

    print("first {} items ok!".format(i))

# Save the updated DataFrame to a new CSV file
updated_file_path = './Updated_Hotel_Details_Booking_with_Images_ALL.csv'
all_hotels_df.to_csv(updated_file_path, index=False)

print(f"All updated hotel details with image URLs have been saved to: {updated_file_path}")
