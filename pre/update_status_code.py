import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import time

# Load the updated hotel details from the CSV file
updated_hotel_details_path = './Updated_Hotel_Details.csv'
updated_hotel_details_df = pd.read_csv(updated_hotel_details_path)

# Function to check the URL and return the updated status code
def check_url_status(url):
    try:
        response = requests.get(url, allow_redirects=True)
        return url, response.status_code  # Return the final status code
    except Exception as e:
        return url, 'error'  # Return 'error' if the URL is not accessible

# Filter the DataFrame for URLs that previously returned a 429 status code
urls_to_recheck = updated_hotel_details_df[updated_hotel_details_df['url_status_code'] == '429']['url'].tolist()

# Prepare a dictionary to hold the updated status codes
updated_status_codes = {}

# Check if there are any URLs to recheck
if urls_to_recheck:
    with ThreadPoolExecutor(max_workers=50) as executor:
        # Prepare the futures for the URLs to recheck
        future_to_url = {executor.submit(check_url_status, url): url for url in urls_to_recheck}
        
        # Iterate through the futures as they complete (while displaying a progress bar)
        for future in tqdm(as_completed(future_to_url), total=len(future_to_url), desc='Rechecking URLs'):
            url = future_to_url[future]
            try:
                new_status_code = future.result()[1]  # Get the updated status code
                updated_status_codes[url] = new_status_code
            except Exception as e:
                updated_status_codes[url] = 'error'  # In case of any exception, mark as 'error'
            time.sleep(0.05)  # Add a delay to avoid hitting rate limits

    # Update the DataFrame with the new status codes
    for url, new_status_code in updated_status_codes.items():
        updated_hotel_details_df.loc[updated_hotel_details_df['url'] == url, 'url_status_code'] = new_status_code

    # Save the updated DataFrame to a new CSV file
    final_updated_csv_path = './Final_Updated_Hotel_Details.csv'
    updated_hotel_details_df.to_csv(final_updated_csv_path, index=False)

    print(f'Final updated hotel details have been saved to: {final_updated_csv_path}')
else:
    print("No URLs with status code 429 to recheck.")