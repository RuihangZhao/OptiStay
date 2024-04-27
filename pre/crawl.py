import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


if not os.path.exists('hotel_images'):
    os.makedirs('hotel_images')

import pandas as pd

df = pd.read_csv('Hotel_details.csv')

url_lis = []
for index, row in df.iterrows():
    url = row['url']
    url_lis.append(url)

for i in range(5,6):

    print(url_lis[5])
    response = requests.get(url_lis[i])
    soup = BeautifulSoup(response.text, 'html.parser')

    anchor_tags = soup.find_all('a', {'href': '#'})
    img_urls = []
    for anchor_tag in anchor_tags:
        img_tag = anchor_tag.find('img')
        if img_tag:
            img_url = urljoin(url_lis[5], img_tag['src'])
            img_urls.append(img_url)
    print(img_urls)
    print(len(img_urls))