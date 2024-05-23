
interface Provider {
  methods: {
    [key: string]: (unknown) => Promise<unknown>;
  };
  data: {
    [key: string]: unknown;
  };
}
