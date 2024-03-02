# import requests
# from tqdm import tqdm
# from concurrent.futures import ThreadPoolExecutor
# import pandas as pd
#
#
# def check_url(url):
#     try:
#         response = requests.head(url)
#         if response.status_code == 200:
#             return True
#         else:
#             return False
#     except requests.exceptions.RequestException as e:
#         return False
#
#
# def check_redirect(url):
#     try:
#         response = requests.get(url, allow_redirects=False)
#         if response.status_code == 301 or response.status_code == 302:
#             return True
#         else:
#             return False
#     except requests.exceptions.RequestException:
#         return False
#
# def process_url(url):
#     if url.startswith("http://"):
#         url = "https://" + url[len("http://"):]
#     redirected = check_redirect(url)
#     return redirected
#
# def calculate_redirect_percentage(csv_file_path):
#     # 读取CSV文件
#     df = pd.read_csv(csv_file_path)
#
#     # 提取URL列数据
#     urls_to_check = df['url'].tolist()
#
#     # 使用多线程检测URL并计算重定向百分比
#     total_urls = len(urls_to_check)
#     redirected_count = 0
#
#     with ThreadPoolExecutor(max_workers=5) as executor:
#         for result in tqdm(executor.map(process_url, urls_to_check), total=total_urls, desc="Checking URLs"):
#             if result:
#                 redirected_count += 1
#
#     redirect_percentage = (redirected_count / total_urls) * 100
#     return redirect_percentage
#
#
# # 请将文件路径替换为实际文件路径
# csv_file_path = r'C:\Users\16353\Desktop\hotel data\Hotel_details.csv'
#
# redirect_percentage = calculate_redirect_percentage(csv_file_path)
# print(f"Percentage of URLs that redirect: {redirect_percentage:.2f}%")

import requests
import pandas as pd
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor
import random

def check_redirect(url):
    try:
        response = requests.get(url, allow_redirects=False)
        if response.status_code == 301 or response.status_code == 302:
            return True
        else:
            return False
    except requests.exceptions.RequestException:
        return False

def process_url(url):
    # 在处理URL之前，检查是否以http://开头，如果是，则改为https://
    if url.startswith("http://"):
        url = "https://" + url[len("http://"):]

    redirected = check_redirect(url)
    return redirected

def calculate_redirect_percentage(sampled_urls):
    # 使用多线程检测URL并计算重定向百分比
    total_urls = len(sampled_urls)
    redirected_count = 0

    with ThreadPoolExecutor(max_workers=5) as executor:
        for result in tqdm(executor.map(process_url, sampled_urls), total=total_urls, desc="Checking URLs"):
            if result:
                redirected_count += 1

    redirect_percentage = (redirected_count / total_urls) * 100
    return redirect_percentage


# 请将文件路径替换为实际文件路径
csv_file_path = r'C:\Users\16353\Desktop\hotel data\Hotel_details.csv'

# 读取CSV文件
df = pd.read_csv(csv_file_path)

# 提取URL列数据
all_urls = df['url'].tolist()

# 随机抽样500个URL
sampled_urls = random.sample(all_urls, 500)

# 计算重定向百分比
redirect_percentage = calculate_redirect_percentage(sampled_urls)
print(f"Percentage of sampled URLs that redirect: {redirect_percentage:.2f}%")

