import { Injectable } from "../../src/runtime/ioc/Injectable";
import { Serializable } from "../../src/runtime/utils/StateUtils";

@Injectable()
export default class TestService {

  @Serializable('TestService')
  public state: any = {
    isLoading: false,
    items: [],
  };

  public async loadData(): Promise<void> {
    try {
      this.state.isLoading = true;
      const response = await fetch('https://my-json-server.typicode.com/typicode/demo/posts');
      const data = await response.json();
      
      console.log(data);

      this.state.items = data;
    } catch (err) {
      console.log(err);
    } finally {
      this.state.isLoading = false;
    }
  }

}