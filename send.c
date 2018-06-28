#include<stdio.h>
#include<stdlib.h>
#include<wiringPi.h>

int main(int argc, char **argv) {
	
	// wiring pi setup
	if (wiringPiSetupGpio() < 0) {
		fprintf(stderr, "Failed to setup wiring pi\n");
		return 1;
	}
	
	// obtain send pin number
	int pin = 18;
	if (argc > 1) {
		pin = atoi(argv[1]);
	}
	fprintf(stderr, "GPIO Pin Number: %d\n", pin);
	
	// obtain repeat number
	int repeat = 1;
	if (argc > 2) {
		repeat = atoi(argv[2]);
	}
	
	// obtain repeat delay
	int delay = 50000;
	if (argc > 3) {
		delay = atoi(argv[3]);
	}
	
	// set gpio pin mode
	pinMode(pin, PWM_OUTPUT);
	pwmSetMode(PWM_MODE_MS);
	pwmSetRange(3);
	pwmSetClock(168);
	
	int count, offset;
	unsigned int on, off;
	unsigned int buffer[1024];
	offset = 0;
	
	fprintf(stderr, "Reading begin\n");
		
	while(1) {
		count = scanf("%u%u", &on, &off);
		
		if (count > 0) {
			buffer[offset++] = on;
		}
		
		if (count < 2 || off == 0) {
			break;
		}
		buffer[offset++] = off;
	}
	
	fprintf(stderr, "Reading end\n");
	
	int i, j, state = 0;
	pwmWrite(pin, 0);
	
	fprintf(stderr, "Sending begin\n");
	
	for (i = 0; i < repeat; i++) {
		for (j = 0; j < offset; j++) {
			pwmWrite(pin, state = !state);
			delayMicroseconds(buffer[j]);
		}
		pwmWrite(pin, state = 0);
		delayMicroseconds(delay);
	}
	
	fprintf(stderr, "Sending end\n");
	
	return 0;
}
