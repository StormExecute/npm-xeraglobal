export = (content: string): true | false => {

	if(content.length < 29) return false;

	if(
		content[0] === "/"
		&&
		content[1] === "/"
		&&
		content[2] === "M"
		&&
		content[3] === "O"
		&&
		content[4] === "D"
		&&
		content[5] === "I"
		&&
		content[6] === "F"
		&&
		content[7] === "I"
		&&
		content[8] === "E"
		&&
		content[9] === "D"
		&&
		content[10] === "-"
		&&
		content[11] === "B"
		&&
		content[12] === "Y"
		&&
		content[13] === "-"
		&&
		content[14] === "N"
		&&
		content[15] === "P"
		&&
		content[16] === "M"
		&&
		content[17] === "-"
		&&
		content[18] === "X"
		&&
		content[19] === "E"
		&&
		content[20] === "R"
		&&
		content[21] === "A"
		&&
		content[22] === "G"
		&&
		content[23] === "L"
		&&
		content[24] === "O"
		&&
		content[25] === "B"
		&&
		content[26] === "A"
		&&
		content[27] === "L"
		&&
		content[28] === "\n"
	) {

		return true;

	}

	return false;

};