function extractIdFromTag(input: string): string {
    const regex = /<id>(.*?)<\/id>/;
    const match = regex.exec(input);

    if (match && match.length > 1) {
        return input.replace(match[0], '');
    } else {
        return input;
    }
}