# OptiStay

1. Requirements <br>
   Create a virtual environment (venv), then use pip to install Flask, Flask-cors and requests. <br>
2. Seting Environment PATH <br>
   If you are using Windows, run SET ./bin/activate <br>
   If you are using Linux/MacOS, run source ./bin/activate <br>
3. Run the program <br>
   python main.py

--for mac
python3 -m venv env

source env/bin/activate

pip install flask

pip install flask-cors

pip install requests

cd OptiStay

python main.py


--file structure(start the web app from index.html please)

pre (files for data cleaning)

  update_status_code.py filter invalid URL
  
  get_image_urls.py get image url for each hotels
  
  Firebase_data.py process and upload data to Firebase
  
  other for testing
  
static (HTML, CSS, Javascript)

  index.html home page
  
  result.html result page
  
  home.js javascript code for end-user interface
  
  styles.css, result.css for style
  
  dashboard
  
    dashboard.html dashboard page
    
    dashboard.js javascript code for dashboard page
    
    dataset.html hotels dataset page
    
    dataset.js javascript code for hotels dataset page
    
    analysis.html user analysis page 
    
    analysis.js javascript code for user analysis page
    
main.py flask backend code
    
  
