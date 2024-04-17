from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from datetime import datetime
from itertools import islice

DATABASE_URL_1 = 'https://dsci551-5pm-9f5a2-default-rtdb.firebaseio.com/hotels'
DATABASE_URL_2 = 'https://dsci551-pro2-default-rtdb.firebaseio.com/hotels'
# 还没写完DATABASE_URL_2的get

DATABASE_URL_USERDATA = 'https://optistay-b3582-default-rtdb.firebaseio.com/'

app = Flask(__name__, static_url_path="")
CORS(app)
receivedData = None


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/searchKey", methods=['POST', 'GET'])
def searchKey():
    global receivedData
    if request.method == 'POST':
        receivedData = request.data
        # print(type(receivedData))
        userSearchData = json.loads(receivedData.decode("utf-8"))
        userSearchData['searchTime'] = datetime.now().timestamp()
        requests.post(DATABASE_URL_USERDATA + 'transactions.json', json=userSearchData)
        response = jsonify({'message': 'Successfully received data!'})
    else:
        if receivedData:
            # print(receivedData)
            # print(type(receivedData))
            response = jsonify(json.loads(receivedData.decode("utf-8")))
        else:
            response = jsonify({"country": "", "city": "", "address": "", "zipcode": ""})
        response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/hotelInfo')
def hotelInfo():
    country = request.args.get('country', None)
    city = request.args.get('city', None)
    address = request.args.get('address', None)
    zipcode = request.args.get('zipcode', None)

    db_urls = [DATABASE_URL_1, DATABASE_URL_2]

    if country:
        if country[0].upper() <= 'H':
            db_urls = [DATABASE_URL_1]
        else:
            db_urls = [DATABASE_URL_2]

    hotelData = []
    for db_url in db_urls:
        if zipcode:
            url = db_url + '.json?orderBy="zipcode"&equalTo=' + zipcode
        elif city:
            url = db_url + '.json?orderBy="city"&equalTo="' + city + '"'
        elif address:
            url = db_url + '.json?orderBy="address"&equalTo="' + address + '"'
        else:
            url = db_url + '.json'

        data = list(json.loads(requests.get(url).text).values())
        hotelData.extend(data)

    def filterOnKeys(data):
        if country and not data.get('country') == country:
            return False
        if city and not data.get('city') == city:
            return False
        if address and address not in data.get('address'):
            return False
        if zipcode and not data.get('zipcode') == int(zipcode):
            return False
        return True

    if country or city or address or zipcode:
        hotelData = list(filter(filterOnKeys, hotelData))

    hotelData = sorted(hotelData, key=lambda x: x.get("starrating", 0), reverse=True)

    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    start = (page - 1) * limit
    end = min(start + limit, len(hotelData))
    paginated_data = hotelData[start:end]

    response = jsonify({'hotelData': paginated_data, 'length': len(hotelData)})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/dashboard')
def dashboardInfo():
    response1 = requests.get(DATABASE_URL_1 + '.json').text
    data1 = json.loads(response1)
    response2 = requests.get(DATABASE_URL_2 + '.json').text
    data2 = json.loads(response1)
    data1.update(data2)
    return data1

@app.route('/user_analysis')
def userRecordInfo():
    response = requests.get(DATABASE_URL_USERDATA+'.json').text
    data = json.loads(response)
    return data

@app.route('/dataset')
def datasetInfo():
    response1 = requests.get(DATABASE_URL_1 + '.json').text
    data1 = json.loads(response1)
    first_1000_pairs = dict(islice(data1.items(), 1000))
    return first_1000_pairs

@app.route('/delete-hotel/<string:hotel_id>', methods=['DELETE'])
def delete_hotel(hotel_id):
    url1 = f"{DATABASE_URL_1}/{hotel_id}.json"
    url2 = f"{DATABASE_URL_2}/{hotel_id}.json"
    response1 = requests.delete(url1)
    response2 = requests.delete(url2)

    if response1.status_code == 200:
        return jsonify({"success": True, "message": f"Hotel with ID: {hotel_id} deleted successfully from db1"})
    elif response2.status_code == 200:
        return jsonify({"success": True, "message": f"Hotel with ID: {hotel_id} deleted successfully from db2"})
    else:
        return jsonify({"success": False, "message": "Failed to delete the hotel", "error": response1.json()})

@app.route('/insert-hotel/<string:hotel_id>', methods=['PUT'])
def insert_hotel(hotel_id):
    new_hotel_data = request.json

    country = new_hotel_data['country']
    if country[0].upper() in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']:
        insert_url = DATABASE_URL_1
    else:
        insert_url = DATABASE_URL_2

    response = requests.put(insert_url + f'/{hotel_id}.json', json=new_hotel_data)

    if response.status_code == 200:
        return jsonify({"success": True, "message": f"New hotel inserted successfully in {insert_url}", "hotel_id": hotel_id})
    else:
        return jsonify({"success": False, "message": "Failed to insert the hotel", "error": response.json()})

@app.route('/update-hotel/<string:hotel_id>', methods=['PUT'])
def update_hotel(hotel_id):
    field = request.json['field']
    value = request.json['value']
    country = request.json['country']

    if country[0].upper() in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']:
        update_url = DATABASE_URL_1
    else:
        update_url = DATABASE_URL_2

    url = f"{update_url}/{hotel_id}.json"
    patch_data = {field: value}
    response = requests.patch(url, json=patch_data)

    if response.status_code != 200:
        return jsonify({"success": False, "message": "Failed to update hotel field"})

    return jsonify({"success": True, "message": "Hotel field updated successfully"})


if __name__ == '__main__':
    app.run(debug=True)
