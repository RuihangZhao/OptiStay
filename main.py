from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json


DATABASE_URL = 'https://dsci551-5pm-9f5a2-default-rtdb.firebaseio.com/hotels'
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

    # get data, using city as filter key, ignore country
    db_url = DATABASE_URL + '.json?orderBy="city"&equalTo="' + city + '"'
    hotelData = json.loads(requests.get(db_url).text)
    hotelData = sorted(hotelData.values(), key=lambda x: x["starrating"], reverse=True)

    # divide the data into pages, default is 20 items per page
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    start = (page - 1) * limit
    end = min(start + limit, len(hotelData) - 1)
    paginated_data = hotelData[start:end]

    response = jsonify({'hotelData': paginated_data,
                        'length': len(hotelData)})

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run()



