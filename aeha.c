#include<stdio.h>
#include<stdlib.h>

int main() {
	
	int count, offset = -1;
	unsigned int on, off;
	unsigned char byte = 0;
			
	while(1) {
		count = scanf("%u%u", &on, &off);
		if (count < 2 || off == 0) {
			break;
		}
		
		if (on > 2000) {
			if (offset >= 0) printf("\n");
			offset = 0;
			byte = 0;
		} else {
           		byte |= (off > on * 2) << offset++;
           		 
           		if ((offset & 7) == 0) {
           			printf("%02X ", byte);
           			offset = 0;
           			byte = 0;
            		}
        	}
	}
	printf("\n");

	return 0;
}
