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

    # get data, filter key order: zipcode -> city -> country -> address
    if zipcode:
        db_url = DATABASE_URL_1 + '.json?orderBy="zipcode"&equalTo=' + zipcode
    elif city:
        db_url = DATABASE_URL_1 + '.json?orderBy="city"&equalTo="' + city + '"'
    elif country:
        db_url = DATABASE_URL_1 + '.json?orderBy="country"&equalTo="' + country + '"'
    else:
        db_url = DATABASE_URL_1 + '.json?orderBy="address"&equalTo="' + address + '"'

    hotelData = list(json.loads(requests.get(db_url).text).values())
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

    hotelData = list(filter(filterOnKeys, hotelData))
    hotelData = sorted(hotelData, key=lambda x: x["starrating"], reverse=True)

    # divide the data into pages, default is 20 items per page
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    start = (page - 1) * limit
    end = min(start + limit, len(hotelData))
    paginated_data = hotelData[start:end]

    response = jsonify({'hotelData': paginated_data,
                        'length': len(hotelData)})

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

if __name__ == '__main__':
    app.run(debug=True)
