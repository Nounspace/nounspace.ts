export function createResource<T>(promise: Promise<T>) {
    let status = "pending";
    let result: T;
    const suspender = promise.then(
      (r) => {
        status = "success";
        result = r;
      },
      (e) => {
        status = "error";
        result = e;
      }
    );
  
    return {
      read() {
        if (status === "pending") {
          throw suspender;
        } else if (status === "error") {
          throw result;
        } else if (status === "success") {
          return result;
        }
      },
    };
  }