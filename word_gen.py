import json
import sys

words = []

source = "word_opts.txt" if len(sys.argv) == 1 else "valid_words.txt"
dest = "src/data/words_list.json" if len(sys.argv) == 1 \
    else "src/data/valid_words_list.json"

with open(source, "r") as file:
    words.extend(filter(lambda word: len(word) == 5, file.read().splitlines()))

with open(dest, "x") as target_file:
    data = json.dumps(words)
    target_file.write(data)

print("Wrote to file")
