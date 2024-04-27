import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import pandas as pd
import numpy as np


def simple_hash(country):
    if country[0].upper() in 'ABCDEFGH':
        return 0  
    else:
        return 1 


df = pd.read_csv('./Updated_Hotel_Details_Booking_with_Images_ALL.csv')
df.replace([np.nan, np.inf, -np.inf], None, inplace=True)
df['db_index'] = df['country'].apply(simple_hash)

df_db1 = df[df['db_index'] == 0]
df_db2 = df[df['db_index'] == 1]

cred1 = credentials.Certificate('./dsci551-5pm-9f5a2-firebase-adminsdk-fy0tj-02520de951.json')
app1 = firebase_admin.initialize_app(cred1, {'databaseURL': 'https://dsci551-5pm-9f5a2-default-rtdb.firebaseio.com/'}, name='app1')
cred2 = credentials.Certificate('./dsci551-pro2-firebase-adminsdk-kjqaw-7f150c806a.json')
app2 = firebase_admin.initialize_app(cred2, {'databaseURL': 'https://dsci551-pro2-default-rtdb.firebaseio.com/'}, name='app2')

# 清理并上传数据
def clear_and_upload(ref, data):
    ref.set({})
    updated_data = {}
    for hotel in data:
        hotelid = hotel.pop('hotelid')
        updated_data[hotelid] = hotel
    ref.update(updated_data)

ref1 = db.reference('hotels', app=app1)
hotels_data_db1 = df_db1.drop(columns='db_index').to_dict(orient='records')
clear_and_upload(ref1, hotels_data_db1)

ref2 = db.reference('hotels', app=app2) 
hotels_data_db2 = df_db2.drop(columns='db_index').to_dict(orient='records')
clear_and_upload(ref2, hotels_data_db2)


firebase_admin.delete_app(app1)
firebase_admin.delete_app(app2)