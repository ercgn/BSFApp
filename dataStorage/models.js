
export const CachePolicy = {
  None: 0,
  Memory: 1,
  AsyncStorage: 2,
};

export const Models = {
  Book: {
    key: "BOOK",
    restUri: "http://cbsf.azurewebsites.net/",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  Lesson: {
    key: "LESSON",
    restUri: "http://cbsf.azurewebsites.net/",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  Passage: {
    key: "PASSAGE",
    restUri: "http://turbozv.com/bsf/api/",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  Answer: {
    key: "ANSWER",
    restUri: "",
    cachePolicy: CachePolicy.AsyncStorage,
  },  
}