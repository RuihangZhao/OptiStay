import requests
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import time

# Define constants for batch processing
BATCH_SIZE = 10000  # Number of URLs to process in each batch
UNDESIRED_URL_PREFIX = "https://www.booking.com/city"
# Load the hotel details
hotel_details_df = pd.read_csv('./Hotel_details.csv')  # Replace with your actual file path

# Function to check URL accessibility and record the actual status code
def check_url_status(url):
    try:
        response = requests.get(url, allow_redirects=True)
        final_url = response.url  # Get the final URL after any redirections
        final_status = response.status_code
        # Check if the response was redirected to an undesired URL
        if final_url.startswith(UNDESIRED_URL_PREFIX):
            return url, 'undesired_redirect', final_url  # Mark these as 'undesired_redirect'
        elif response.history:  # If there was any other redirection
            final_status = f"redirected_{final_status}"
        return url, str(final_status), final_url
    except Exception as e:
        return url, 'error', None  # Return 'error' if not accessible, and None for final URL

# Determine which batch to process based on previously saved data
try:
    with open('./last_processed_index.txt', 'r') as file:
        last_processed_index = int(file.read().strip())
except (FileNotFoundError, ValueError):
    last_processed_index = 0  # Start from the beginning if no tracker file exists

# Calculate start and end index for the current batch
start_index = last_processed_index
end_index = min(start_index + BATCH_SIZE, len(hotel_details_df))  # Ensure we do not go beyond the DataFrame

# Set up ThreadPoolExecutor for concurrent requests
with ThreadPoolExecutor(max_workers=100) as executor:
    futures = {executor.submit(check_url_status, url): url for url in hotel_details_df['url'][start_index:end_index]}
    processed_urls = 0

    for future in tqdm(as_completed(futures), total=end_index - start_index, desc="Checking URLs"):
        url, status_code, final_url = future.result()
        # Only update DataFrame if URL did not redirect to undesired location
        if status_code != 'undesired_redirect':
            hotel_details_df.loc[hotel_details_df['url'] == url, 'url_status_code'] = status_code
            hotel_details_df.loc[hotel_details_df['url'] == url, 'final_url'] = final_url
        processed_urls += 1

        # Sleep after every 5000 URLs to avoid hitting rate limits
        if processed_urls % 5000 == 0:
            print(f"Processed {processed_urls} URLs, sleeping for a while...")
            time.sleep(5)  # Sleep for 60 seconds; adjust the time as necessary

# Save the updated DataFrame to a new CSV file
filtered_hotel_details_path = './Filtered_Hotel_Details_From_' + str(start_index) + '.csv'  # Change this to indicate the batch
hotel_details_df.to_csv(filtered_hotel_details_path, index=False)

# Update the tracker file with the index of the last URL processed in this batch
with open('./last_processed_index.txt', 'w') as file:
    file.write(str(end_index))

print(f"Filtered hotel details from {start_index} to {end_index} saved to: {filtered_hotel_details_path}")
print(f"Last processed index: {end_index}")