export class JsonDefault{
  public static default(){
    return {
      "products": [{
        "name": "car",
        "product": [{
          "name": "honda",
          "model": [{"id": "civic", "name": "civic"}, {"id": "accord", "name": "accord"}, {
            "id": "crv",
            "name": "crv"
          }, {"id": "pilot", "name": "pilot"}, {"id": "odyssey", "name": "odyssey"}]
        }]
      }]
    };
  }
}
